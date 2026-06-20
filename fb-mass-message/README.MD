- **Mass Message Sender (`fb-mass-message.js`)**: Automatically sends a predefined text message to all currently loaded conversations on Messenger web with safe, randomized intervals.

### How to use Mass Message Sender

1. Open your browser and navigate to Messenger: `https://www.facebook.com/messages/t/`
2. Scroll down the left chat list sidebar to load as many friends/conversations as you want to target.
3. Open **Developer Tools** (`F12`) -> **Console** tab.
4. Open `fb-mass-message.js`, change the `MESSAGE_CONTENT` inside the `CONFIG` block to your desired text.
5. Copy the entire modified script, paste it into the console, and press **Enter**.

❗❗❗⚠️⚠️⚠️ For messaging tools, Facebook is very strict in scanning for identical text strings sent repeatedly. You shouldn't run this script to more than 30-50 people consecutively at one time, and you should set the MIN_DELAY and MAX_DELAY very high (e.g., above 5000ms) to protect your account.
