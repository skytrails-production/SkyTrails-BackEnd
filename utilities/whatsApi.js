const axios = require("axios");
const sdk = require("api")("@doubletick/v2.0#19ixm2gblq0ov4vn");
const { v4: uuidv4 } = require("uuid");
const apiKey=process.env.DOUBLE_TICK_API_KEY;
const doubleTickNumber=process.env.DOUBLE_TICK_NUMBER;
const doubleTick=process.env.DOUBLETICK_URL;
sdk.auth(process.env.DOUBLE_TICK_API_KEY);
// async function sendWhatsAppMessage(number, msg) {
//   try {
//     const whatsappAPIUrl = process.env.WHATSAPP_URL;
//     const apiKey = process.env.WHATSAPP_API_KEY;
//     const mobileNumbers = number;
//     const message = msg;
//     const response = await axios.get(
//       `${whatsappAPIUrl}?apikey=${apiKey}&mobile=${mobileNumbers}&msg=${message}`
//     );
//     if (!response) {
//       console.log("response===========Error in uploading image");
//     }
//     return response.data;
//   } catch (error) {
//     console.error("Error in WhatsApp API:", error);
//   }
// }
async function sendMessageWhatsApp(number, var1,var2,temName) {
  try{
    const options = {
      method: 'POST',
      url: doubleTick,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: apiKey
      },
      data: {
        messages: [
          {
            content: {
              language: 'en',
              templateData: {
                header: {
                  type: 'TEXT',
                  placeholder: 'Header text',
                  mediaUrl: 'https://example.com/image.png',
                  filename: 'Document caption'
                },
                body: {placeholders: [var1,var2]}
              },
              templateName: temName
            },
            from: doubleTickNumber,
            to: number
          }
        ]
      }
    };
    const response= await axios.request(options);
    if(response.data.messages[0]){
      return response.data.messages[0];
    }
  }
  catch(err){
    console.log("erorr while send whatsapp=====>>>>>>",err.response)
  }
}

module.exports = {sendMessageWhatsApp };

// const axios = require('axios');

// const options = {
//   method: 'POST',
//   url: 'https://public.doubletick.io/whatsapp/message/text',
//   headers: {
//     accept: 'application/json',
//     'content-type': 'application/json',
//     Authorization: 'key_IqTwUC2O8n'
//   },
//   data: {
//     content: {
//       text: 'could you please provide your 𝐂𝐕, a copy of your 𝐩𝐚𝐬𝐬𝐩𝐨𝐫𝐭, and a brief, 𝟏-𝐦𝐢𝐧𝐮𝐭𝐞 𝐢𝐧𝐭𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧 𝐯𝐢𝐝𝐞𝐨 at your earliest convenience? Your cooperation is highly appreciated, and this information will help us ensure a smooth and efficient process.  To unsubscribe, please reply STOP',
//       previewUrl: true
//     },
//     from: '8800517859',
//     to: '918287850111',
//     messageId: '49d06b4b-6804-4e11-a4dc-598d69ad7cc5'
//   }
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });
