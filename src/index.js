// Import required modules
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const ethers = require('ethers');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Load environment variables
const { TOKEN, SERVER_URL, API_KEY } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

// Initialize Express app
const app = express();
app.use(bodyParser.json());

/**
 * Send a message to a Telegram chat
 * @param {string} chatId - The ID of the chat to send the message to
 * @param {string} text - The text of the message
 * @param {Object} replyMarkup - Optional reply markup for the message
 */
const sendMessage = async (chatId, text, replyMarkup) => {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: text,
    reply_markup: replyMarkup,
  });
};

// Object to store profile data for each chat
const profileData = {};

/**
 * Handle the /start command
 * @param {string} chatId - The ID of the chat
 */
const handleStartCommand = async (chatId) => {
  const welcomeText =
    "Welcome! Let's create your Universal Profile. First, please provide your name.";
  await sendMessage(chatId, welcomeText);
  profileData[chatId] = { step: 'name' };
};

/**
 * Create a Universal Profile
 * @param {string} chatId - The ID of the chat
 * @param {Object} data - The profile data
 */
const createProfile = async (chatId, data) => {
  await sendMessage(chatId, 'Creating your profile. Please wait...');

  const apiUrl =
    'https://relayer-api.testnet.lukso.network/v1/relayer/universal-profile';

  // Define the bytes32 values for the profile
  const bytes32Values = [
    '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    '0x4b80742de2bf82acb36300007870c5b8bc9572a8001c3f96f7ff59961b23500d',
    '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000001',
    '0x4b80742de2bf82acb3630000' + data.address.substring(2),
  ];

  // Define the bytes values for the profile
  const bytesValues = [
    '0x7870c5b8bc9572a8001c3f96f7ff59961b23500d',
    '0x0000000000000000000000000000000000000000000000000000000000060080',
    '0x00000000000000000000000000000002',
    '0x7870c5b8bc9572a8001c3f96f7ff59961b23500d',
    data.address,
    '0x00000000000000000000000000000000000000000000000000000000007f3f06',
  ];

  // Encode the calldata
  const abiCoder = new ethers.utils.AbiCoder();
  const encodedCalldata = abiCoder.encode(
    ['bytes32[]', 'bytes[]'],
    [bytes32Values, bytesValues],
  );

  // Generate a random salt
  const salt = `0x${crypto.randomBytes(32).toString('hex')}`;

  // Prepare the request body
  const requestBody = {
    salt: salt,
    postDeploymentCallData: encodedCalldata,
  };

  try {
    // Send the request to create the profile
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Prepare and send the success message
    const successMessage = `Your Universal Profile has been created!
Address: ${response.data.universalProfileAddress}
Transaction: ${response.data.transactionHash}`;

    await sendMessage(chatId, successMessage);
  } catch (error) {
    // Handle any errors
    await sendMessage(
      chatId,
      'There was an error creating the profile. Please try again later.',
    );
  }

  // Clear the profile data for this chat
  delete profileData[chatId];
};

// Handle incoming POST requests
app.post(URI, async (req, res) => {
  const chatId = req.body.message?.chat.id;
  const text = req.body.message?.text;

  if (text === '/start') {
    // Handle the start command
    await handleStartCommand(chatId);
  } else if (profileData[chatId]) {
    // Handle profile creation steps
    switch (profileData[chatId].step) {
      case 'name':
        profileData[chatId].name = text;
        profileData[chatId].step = 'description';
        await sendMessage(
          chatId,
          'Great! Now please provide a description for your profile.',
        );
        break;
      case 'description':
        profileData[chatId].description = text;
        profileData[chatId].step = 'profilePic';
        await sendMessage(
          chatId,
          'Excellent! Now, please send a URL for your profile picture.',
        );
        break;
      case 'profilePic':
        profileData[chatId].profilePic = text;
        profileData[chatId].step = 'address';
        await sendMessage(
          chatId,
          'Almost done! Finally, please provide an Ethereum address.',
        );
        break;
      case 'address':
        profileData[chatId].address = text;
        await createProfile(chatId, profileData[chatId]);
        break;
    }
  }

  return res.send();
});

/**
 * Initialize the webhook
 */
const init = async () => {
  await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
};

// Start the server
app.listen(process.env.PORT || 5001, async () => {
  console.log('App running on port', process.env.PORT || 5001);
  await init();
});
