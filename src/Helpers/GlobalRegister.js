/** Registers passed object in global scope.
 * It is useful for debugging purposes.
 * @param { any } obj
 */
function globalRegister(obj) {
  if (typeof global === 'undefined') {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- For debugging purposes.
  global[obj.name] = obj;
}

globalRegister(globalRegister);
