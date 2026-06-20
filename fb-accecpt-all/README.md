# Facebook Auto Friend Request Acceptor

A lightweight, vanilla JavaScript utility script designed to automate the process of accepting multiple friend requests on Facebook web via Browser Developer Console.

## Features

- **Automated Processing**: Instantly targets and triggers the confirmation action on all visible friend requests.
- **Human-like Delay**: Implements a randomized interval delay (`500ms` - `1200ms`) between clicks to prevent rate limits and security flags.
- **Clean Execution**: Independent code block with zero external dependencies.

## Usage

1. Open your browser and navigate to the Facebook Friend Requests page:
   `https://www.facebook.com/friends/requests`
2. Scroll down to populate the list with the desired amount of profiles you want to accept.
3. Press `F12` (or `Ctrl+Shift+I` on Windows/Linux, `Cmd+Opt+I` on macOS) to open **Developer Tools**.
4. Switch to the **Console** tab.
5. Copy the entire contents of `fb-accept-all.js`, paste it into the console layout, and press **Enter**.

## Configuration

You can easily tweak the processing speed inside the `CONFIG` block within the script:

```javascript
const CONFIG = {
  // ...
  MIN_DELAY: 500, // Minimum execution interval in milliseconds
  MAX_DELAY: 1200, // Maximum execution interval in milliseconds
};
```
