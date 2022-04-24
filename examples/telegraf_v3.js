const Telegraf = require('telegraf')
const mediaGroup = require('telegraf-media-group')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(mediaGroup())

bot.on('media_group', async (ctx) => {
  let i = 0
  for (const message of ctx.mediaGroup) {
    await ctx.reply(`hi! ${i}`, {reply_to_message_id: message.message_id})
    i += 1
  }
  return ctx.reply(`total: ${ctx.mediaGroup.length}`)
})

bot.startPolling()
