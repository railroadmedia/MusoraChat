# MusoraChat
This is a custom chat for musora apps.

## Libraries used
* [stream-chat](https://github.com/GetStream/stream-chat-js)
## Installation
```
npm i --save https://github.com/railroadmedia/MusoraChat.git
```

## Props
### MusoraChat
Prop | Type | Required | Description
-----|------|----------|------------
appColor | string | yes | App's specific color; it will be used on confirmation btns for moderators for example
chatId | string | yes | Provided by the BE, chatId is the id of the chat channel
clientId | string | yes | Provided by the BE, clientId is the id of the client to which the user is then connected and chat & questions channels querried
isDark | bool | no | MusoraChat can handle light/dark theme
onRemoveAllMessages | function | yes | Call API's remove all messages endpoint ```.../chat/delete-user-messages?user_id=${userId}```
onToggleBlockStudent | function | yes | Call API's block student endpoint ```.../chat/(un)ban-user?user_id=${userId}```
questionsId | string | yes | Provided by the BE, questionsId is the id of the questions channel
user | object | yes | User's credentials for connecting to client<br />``` { id: "user's id", gsToken: "provided by the BE this is the getstream token" } ```

## EVENTS
### watchersListener(arg1, arg2, arg3, arg4, arg5) event
Arg | Type | Required | Description
-----|------|----------|------------
arg1 (clientId) | string | yes | Provided by the BE clientId is the id of the client to which the user is then connected and chat & questions channels querried
arg2 (chatId) | string | yes | Provided by the BE chatId is the id of the chat channel
arg3 (userId) | string/int | yes | User's id
arg4 (gsToken) | string | yes | Provided by the BE this is the getstream token
arg5 | function | yes | This is a callback function that receives the viewers/watchers number as an argument

```watchersListener()``` returns a promise resolving into a function that once called removes the event listener.


## Examples
### MusoraChat
```
import { MusoraChat } from 'Musorachat';
...
<MusoraChat
  appColor={'#0b76db'}
  chatId={'app_chat'}
  clientId={'a1pvevgrmj91'}
  isDark={true}
  onRemoveAllMessages={userService.removeAllMessages}
  onToggleBlockStudent={userService.toggleBlockStudent}
  questionsId={app_questions}
  user={{ id: 1920123, gsToken: "ADsAD0ASD8JKV1QiLCJhbGciOiJI..." }}
/>
...
```
### watchersListener(arg1, arg2, arg3, arg4, arg5) event
```
import { watchersListener } from 'MusoraChat';
...
componentDidMount() {
 watchersListener(
   'a1pvevgrmj91',
   'app_chat',
   1920123,
   'ADsAD0ASD8JKV1QiLCJhbGciOiJI...',
   viewers => this.setState({ viewers })
  ).then(rwl => (this.removeWatchersListener = rwl));
}

componentWillUnmount() {
  this.removeWatchersListener?.();
}
...
```
