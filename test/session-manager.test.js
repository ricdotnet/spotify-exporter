import {describe, it, expect, beforeAll} from 'vitest';
import SessionManager from '../server/modules/session-manager';

describe('Test the session-manager with file', () => {
  let sessionManager;

  beforeAll(() => {
    sessionManager = new SessionManager({storage: 'file'});
  });

  it('should write a file and add session data', async () => {
    const key = SessionManager.generateKey();

    await sessionManager.create(key);
    await sessionManager.update(key, {foo: 'bar'});

    let sessionData = await sessionManager.get(key);
    sessionData = JSON.parse(sessionData);
    expect(sessionData).toBeTypeOf('object');
    expect(sessionData.foo).toBe('bar');

    await sessionManager.remove(key);
  });
});