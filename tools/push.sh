echo 'Packing, and uploading the app package to app centter'
appcenter codepush release-react -a $1 -d staging --plist-file ios/Calculator/Info.plist 
