/**
 * Assert if {@link cond} is true. Else throws an exception.
 * @param { boolean } cond - Condition to assert.
 * @param { string } errorMessage - Error message to throw.
 */
function assert(cond, errorMessage) {
  if (!cond) {
    throw new Error(errorMessage);
  }
}

globalRegister(assert);
