const seedrandom = require('seedrandom')
let random = seedrandom(`${Date.now()}`)

/**
 * Return a random number between 0 (inclusive) and 1 (exclusive).
 * @returns Random double 0 <= i < 1
 */
module.exports.nextDouble = () => random.double()

/**
 * Return a random integer between 0 (inclusive) and n (exclusive).
 * @param {number} n Upper bound
 * @returns {number} Random integer 0 <= i < n
 */
module.exports.nextInt = (n) => Math.floor(n * random.double())

/**
 * Set the seed of the PRNG.
 * @param {number} seed Seed
 */
module.exports.setSeed = (seed) => {
  random = seedrandom(`${seed}`)
}
