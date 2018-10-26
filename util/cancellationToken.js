/**
 * Create a cancellation token and a cancel function.
 *
 * This is somewhat inspired by monaco's CancellationTokenSource and
 * TC39's Cancellation API proposal.
 */
function createCancellationToken () {
  const onCancelListeners = []
  const token = {
    /**
     * Whether or not the action is cancelled.
     */
    cancelled: false,

    /**
     * Add a callback function to invoke on cancellation.
     * @param {function} listener Function to invoke on cancellation
     */
    onCancel (listener) {
      onCancelListeners.push(listener)
    }
  }

  return {
    /**
     * The cancellation token that is used to check if the action was cancelled.
     */
    token,

    /**
     * Cancel the action.
     */
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
