require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const TGTOKEN = process.env.TELEGRAM_TOKEN
const bot = new TelegramBot(TGTOKEN, {polling: true});
const express = require('express')
const cors = require('cors');
const app = express();

const webAppUrl = 'https://ephemeral-sundae-23745a.netlify.app';

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text

  if(text === '/start'){

    await bot.sendMessage( chatId, "Thanks for your Message", {
        reply_markup: { 
            keyboard: [
                [{text: 'Заполнить форму на странице Form', web_app: { url: webAppUrl + '/form' }}], 
            ]
        }
    });
    
    await bot.sendMessage( chatId,
    "Thanks for your Message", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Простая InlineKeyboard кнопка', web_app: { url: webAppUrl }}], 
            ]
        }
    })
  }

  if(msg?.web_app_data?.data) {
    try{ 
        const data = JSON.parse(msg?.web_app_data?.data)

        await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
        await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
        await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

        setTimeout( async ()=>{
            await bot.sendMessage(chatId, 'Больше информации вы получите скоро..');
        }, 2500)
     }
    catch(e){
        console.log(e);
    }
  }

});

app.post('/web-data', async(req, res)=>{
    const {queryId, products, totalPrice} = req.body;

    // тут можно что-то в БД сохранить или проманипулировать чем-то
    try{
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Успешная покупка",
            input_message_content: {message_text: "Поздравляем с успешной покупкой, вы приобрели товар на сумму: " + totalPrice}

        } )
        return res.status(200).jsaon({})
    } catch(e){
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {message_text: "К сожалению Вам не удалось приобрести товар"}
        } )
        return res.status(500).json({})
    }
})

const PORT = 8000;
app.listen(PORT, ()=>{console.log('Server started on PORT ' + PORT)})