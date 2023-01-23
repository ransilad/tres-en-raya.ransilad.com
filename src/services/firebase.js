import { initializeApp } from 'firebase/app'
import {
  getDatabase
} from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDhZkS2Kgj_mqnuyugJfLs_RcQmA64iiEE',
  authDomain: 'tres-en-raya-c66a8.firebaseapp.com',
  databaseURL: 'https://tres-en-raya-c66a8-default-rtdb.firebaseio.com',
  projectId: 'tres-en-raya-c66a8',
  storageBucket: 'tres-en-raya-c66a8.appspot.com',
  messagingSenderId: '94634013471',
  appId: '1:94634013471:web:755e88a269efafc24cb62a'
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export {
  db
}
