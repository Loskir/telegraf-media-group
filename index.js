const {Composer} = require('telegraf')

const map = new Map()

module.exports = (timeout = 100) => Composer.mount(['photo', 'video'], (ctx, next) => {
  const message = ctx.message || ctx.channelPost
  if (!message.media_group_id) {
    return next()
  }

  if (!map.get(ctx.from.id)) {
    map.set(ctx.from.id, new Map())
  }
  const userMap = map.get(ctx.from.id)
  if (!userMap.get(message.media_group_id)) {
    userMap.set(message.media_group_id, {
      resolve: () => {},
      messages: []
    })
  }
  const mediaGroupOptions = userMap.get(message.media_group_id)

  mediaGroupOptions.resolve(false)
  mediaGroupOptions.messages.push(message)

  return new Promise((resolve) => {
    mediaGroupOptions.resolve = resolve
    setTimeout(() => resolve(true), timeout)
  })
    .then((value) => {
      if (value === true) {
        ctx.mediaGroup = mediaGroupOptions.messages
        ctx.updateSubTypes.push('media_group')
        userMap.delete(message.media_group_id)
        if (userMap.size === 0) {
          map.delete(ctx.from.id)
        }
        return next()
      }
    })
})
