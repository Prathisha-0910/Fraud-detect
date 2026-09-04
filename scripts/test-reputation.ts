import { ReputationEngine } from '../lib/engines/reputation-engine'

console.log('--- TEST asdkjaskjd ---')
console.log(ReputationEngine.analyzeURL('asdkjaskjd'))

console.log('--- TEST http:// ---')
console.log(ReputationEngine.analyzeURL('http://'))

console.log('--- TEST notaurl ---')
console.log(ReputationEngine.analyzeURL('notaurl'))

console.log('--- TEST sbi.co.in ---')
console.log(ReputationEngine.analyzeURL('https://sbi.co.in'))

console.log('--- TEST sbi-kyc-update.xyz ---')
console.log(ReputationEngine.analyzeURL('https://sbi-kyc-update.xyz'))
