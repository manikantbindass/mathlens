import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {isAppURL,isExternalURL}=require('../apps/desktop/navigation.cjs');
test('desktop navigation trusts only the deployed HTTPS origin',()=>{assert.ok(isAppURL('https://mathlens-wine.vercel.app/#/lab'));for(const url of ['http://mathlens-wine.vercel.app','https://mathlens-wine.vercel.app.evil.example','file:///etc/passwd','javascript:alert(1)','https://evil.example'])assert.equal(isAppURL(url),false);});
test('desktop external navigation rejects local and executable protocols',()=>{assert.ok(isExternalURL('https://arxiv.org/abs/1706.03762'));for(const url of ['file:///c:/windows','javascript:alert(1)','data:text/html,hi','mailto:a@example.test','https://user:password@example.test'])assert.equal(isExternalURL(url),false);});
