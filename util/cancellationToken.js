function createCancellationToken () {
  const onCancelListeners = []
  const token = {
    cancelled: false,
    onCancel (listener) {
      onCancelListeners.push(listener)
    }
  }

  return {
    token,
    cancel () {
      if (!token.cancelled) {
        token.cancelled = true
        for (const listener of onCancelListeners) {
          listener()
        }
      }
    }
  }
}

module.exports = createCancellationToken
