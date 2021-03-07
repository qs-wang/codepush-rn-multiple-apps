import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CodePush from "react-native-code-push";
import GridView from 'react-native-super-grid';

const screen = Dimensions.get("window");
const buttonWidth = screen.width / 4;

const items = [
  { name: 'Calculator', background: '#3498db', icon: 'user', id: process.env['CAL_APP_KEY'] },
  { name: 'Timer', background: '#ef0202', icon: 'gratipay', id: process.env['TIMER_APP_KEY'] },
  { name: 'Email', background: '#efcf02', icon: 'heart' },
  { name: 'Team', background: '#02ef1d', icon: 'users' },
  { name: 'Meeting', background: '#02cbef', icon: 'group' },
  { name: 'Calendars', background: '#ef5802', icon: 'calendar' },
];

class App extends Component {
  constructor() {
    super();
    this.state = { restartAllowed: true };
  }

  codePushStatusDidChange(syncStatus) {
    switch (syncStatus) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ syncMessage: "Checking for availability." });
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ syncMessage: "Downloading package." });
        break;
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        this.setState({ syncMessage: "Awaiting user action." });
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ syncMessage: "Loading app." });
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        this.setState({ syncMessage: "App up to date.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        this.setState({ syncMessage: "Loading cancelled by user.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ syncMessage: "Update installed and will be applied on restart.", progress: false });
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        this.setState({ syncMessage: "An unknown error occurred.", progress: false });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress });
  }

  toggleAllowRestart() {
    this.state.restartAllowed
      ? CodePush.disallowRestart()
      : CodePush.allowRestart();

    this.setState({ restartAllowed: !this.state.restartAllowed });
  }

  getUpdateMetadata() {
    CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
      .then((metadata) => {
        this.setState({ syncMessage: metadata ? JSON.stringify(metadata) : "Running binary version", progress: false });
      }, (error) => {
        this.setState({ syncMessage: "Error: " + error, progress: false });
      });
  }

  /** Update is downloaded silently, and applied on restart (recommended) */
  sync(id) {
    console.log(`here ${id}`);
    CodePush.sync(
      {
        deploymentKey: id,
        installMode: CodePush.InstallMode.IMMEDIATE,
      },
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
  }

  render() {
    let progressView;

    if (this.state.progress) {
      progressView = (
        <Text style={styles.messages}>{this.state.progress.receivedBytes} of {this.state.progress.totalBytes} bytes received</Text>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to RN multiple APP DEMO!
        </Text>


        <GridView
          itemDimension={130}
          data={items}
          style={styles.gridView}
          renderItem={({ item }) => (
            <View style={styles.container}>
              <TouchableOpacity activeOpacity={.8} style={[styles.button, { backgroundColor: item.background }]} onPress={() => this.sync(item.id)}>
                <Text style={styles.syncButton}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        />


        {progressView}
        <Text style={styles.messages}>{this.state.syncMessage || ""}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gridView: {
    marginTop: 10,
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    paddingTop: 50
  },
  image: {
    margin: 30,
    width: Dimensions.get("window").width - 100,
    height: 365 * (Dimensions.get("window").width - 100) / 651,
  },
  messages: {
    marginTop: 30,
    textAlign: "center",
  },
  restartToggleButton: {
    color: "blue",
    fontSize: 17
  },
  syncButton: {
    color: "#fff",
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: "center",
    fontSize: 17
  },

  button: {
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: "center",
    borderWidth: 3,
    borderRadius: (100 / 2),
    width: 100,
    height: 100,
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 20
  },
});

/**
 * Configured with a MANUAL check frequency for easy testing. For production apps, it is recommended to configure a
 * different check frequency, such as ON_APP_START, for a 'hands-off' approach where CodePush.sync() does not
 * need to be explicitly called. All options of CodePush.sync() are also available in this decorator.
 */
let codePushOptions = {
  deploymentKey: process.env['HOME_APP_KEY'],
  checkFrequency: CodePush.CheckFrequency.MANUAL,
  installMode: CodePush.InstallMode.IMMEDIATE
};

App = CodePush(codePushOptions)(App);

export default App;
