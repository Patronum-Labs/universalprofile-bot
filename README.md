# Universal Profile Telegram Bot

This project is a Telegram bot that creates Universal Profiles (UPs) on LUKSO using the LUKSO Relayer API. The bot collects basic information from users and encodes data keys that specify the Universal Receiver Delegate, its permissions, and a controller provided by the user.

## Features

- Creates Universal Profiles via Telegram interface
- Collects user information (name, description, profile picture URL, Ethereum address)
- Encodes data keys for Universal Receiver Delegate and permissions
- Uses LUKSO Relayer API for profile creation

## Potential Extensions

Developers extending this bot can leverage the collected data (name, profile picture, description) to:

1. Deploy metadata to IPFS using LUKSO data provider, and generate the LSP3Metdata and set it on the profile.
2. Implementing a key system within Telegram, allowing users to perform simple transactions without providing an external address as the controller.

## Prerequisites

- Node.js and npm installed
- LUKSO Relayer API access
- Telegram Bot Token
- ngrok for exposing the local server

## Setup

1. Clone the repository
2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```sh
TOKEN=your_telegram_bot_token
API_KEY=your_lukso_relayer_api_key
SERVER_URL=your_ngrok_url
```

## Obtaining Necessary Credentials

1. Generate a Telegram Bot Token:
- Talk to the BotFather on Telegram
- Follow the prompts to create a new bot
- Save the provided token in the `.env` file as `TOKEN`

2. Request LUKSO Relayer API access:
- Contact LUKSO to request access to the Relayer API
- Once granted, save the API key in the `.env` file as `API_KEY`

3. Set up ngrok:
- Install ngrok: `npm install ngrok`
- Run ngrok: `ngrok http 5001`
- Copy the provided HTTPS URL (e.g., `https://x-x-x-x-x.ngrok-free.app`)
- Save this URL in the `.env` file as `SERVER_URL`

## Running the Bot

1. Start the server:
```
npm run dev
```

Your bot is now active. Send `/start` to your bot on Telegram to begin the profile creation process.

## Note

If you prefer not to use the LUKSO Relayer and have your own method for creating profiles, you can modify the `createProfile` function to implement your custom logic.

## Disclaimer

This bot requires access to the LUKSO Relayer API. Ensure you have the necessary permissions before deploying the bot.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
