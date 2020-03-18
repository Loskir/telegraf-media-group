const {Composer} = require('telegraf')

const map = new Map()

module.exports = (timeout = 100) => Composer.mount('message', (ctx, next) => {
  if (!ctx.message.media_group_id) {
    return next()
  }

  if (!map.get(ctx.from.id)) {
    map.set(ctx.from.id, new Map())
  }
  const userMap = map.get(ctx.from.id)
  if (!userMap.get(ctx.message.media_group_id)) {
    userMap.set(ctx.message.media_group_id, {
      resolve: () => {},
      contexts: []
    })
  }
  const mediaGroupOptions = userMap.get(ctx.message.media_group_id)

  mediaGroupOptions.resolve(false)
  mediaGroupOptions.contexts.push(ctx)

  return new Promise((resolve) => {
    mediaGroupOptions.resolve = resolve
    setTimeout(() => resolve(true), timeout)
  })
    .then((value) => {
      if (value === true) {
        ctx.mediaGroup = mediaGroupOptions.contexts
        ctx.updateSubTypes.push('media_group')
        userMap.delete(ctx.message.media_group_id)
        if (userMap.size === 0) {
          map.delete(ctx.from.id)
        }
        return next()
      }
    })
})
