/** Registers passed object in global scope.
 * It is useful for debugging purposes.
 * @param {any} obj
 */
function globalRegister(obj) {
  if (typeof global === 'undefined') {
    return;
  }

  global[obj.name] = obj;
}

globalRegister(globalRegister);
