require('../../src/Helpers/GlobalRegister');
require('../../src/Helpers/Assert');

describe('Assert', () => {
  it('should throw if condition is false', () => {
    expect(() => assert(false, 'some error')).toThrow('some error');
  });

  it('should not throw if condition is true', () => {
    expect(() => assert(true, 'some error')).not.toThrow();
  });
});
