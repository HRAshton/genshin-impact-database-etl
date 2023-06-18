// noinspection JSUndeclaredVariable
/* eslint-disable no-global-assign */

require('../../src/Helpers/GlobalRegister');

describe('global register', () => {
  class SomeClass {
  }

  it('should register passed object in global scope', () => {
    globalRegister(SomeClass);

    expect(global).toHaveProperty('SomeClass');

    // noinspection JSUnresolvedVariable
    expect(global.SomeClass).toBe(SomeClass);
  });

  it('should not throw if global is undefined', () => {
    const globalBackup = global;
    global = undefined;

    expect(() => globalRegister(SomeClass)).not.toThrow();

    global = globalBackup;
  });
});
