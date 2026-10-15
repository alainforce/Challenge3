import {defineConfig} from 'cypress';

export default defineConfig({
  video:true,
  e2e:{
    specPattern:'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on,browser){
      on('before:browser:launch',(browser,launchOptions)=>{
        if(browser.family==='chromium' && browser.name!=='electron') launchOptions.args.push('--load-extension=dist');
        return launchOptions;
      });
    }
  }
});
