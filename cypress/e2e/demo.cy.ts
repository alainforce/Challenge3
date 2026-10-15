/// <reference types="cypress" />

const happyPage={text:'Your subscription will automatically renew unless you cancel before the end of the current period. This agreement describes billing, privacy, cancellation, refund, and service terms in detail for customers. Please read all sections before using the service.',hiddenContentDetected:false,injectionDetected:false,isLegalDocument:true};
const happyReport={status:'ready',score:31,label:'Düşük',clauses:[{category:'auto_renewal',severity:4,explanation:'Abonelik otomatik yenilenebilir.',quote:'subscription will automatically renew'}],uncertainty:'',rejectedUnverified:0,hiddenContentDetected:false,injectionDetected:false};
const uncertainPage={text:'Short page',hiddenContentDetected:true,injectionDetected:true,isLegalDocument:false};
const uncertainReport={status:'uncertain',score:null,label:'Belirsiz',clauses:[],uncertainty:'Belge kısa veya hukuki belge olarak doğrulanamadı.',rejectedUnverified:0,hiddenContentDetected:true,injectionDetected:true};

describe('Hukuk Metre final demo',()=>{
  beforeEach(()=>{
    cy.intercept('POST','https://generativelanguage.googleapis.com/v1beta/models/*:generateContent',{statusCode:200,body:{candidates:[{content:{parts:[{text:JSON.stringify({isLegalDocument:true,confidence:0.95,uncertainty:'',clauses:[{category:'auto_renewal',severity:4,explanation:'Abonelik otomatik yenilenebilir.',quote:'subscription will automatically renew'}]})}]}}]}}).as('gemini');
  });

  it('scene A: happy path renders a verified quote',()=>{
    cy.visit('/dist/src/sidepanel/index.html',{onBeforeLoad(win){(win as any).__scene='happy';(win as any).chrome={tabs:{query:()=>Promise.resolve([{id:1}]),sendMessage:()=>Promise.resolve(happyPage)},runtime:{sendMessage:()=>Promise.resolve(happyReport)}};}});
    cy.contains('Bu sayfayı analiz et').click();
    cy.contains('31/100');
    cy.contains('subscription will automatically renew');
    cy.contains('Bu uygulama hukuki tavsiye vermez.');
  });

  it('scene B: injection/short page honestly shows Belirsiz and warning',()=>{
    cy.visit('/dist/src/sidepanel/index.html',{onBeforeLoad(win){(win as any).__scene='uncertain';(win as any).chrome={tabs:{query:()=>Promise.resolve([{id:1}]),sendMessage:()=>Promise.resolve(uncertainPage)},runtime:{sendMessage:()=>Promise.resolve(uncertainReport)}};}});
    cy.contains('Bu sayfayı analiz et').click();
    cy.contains('Belirsiz');
    cy.contains('Gizli içerik tespit edildi.');
    cy.contains('Injection benzeri talimat tespit edildi');
  });
});
