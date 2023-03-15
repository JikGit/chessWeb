import {db} from './firebaseConfig'
import { collection, onSnapshot, updateDoc, setDoc, getDocs, getDoc, doc, query, orderBy, limit} from "firebase/firestore"; 

async function createData(nameCollection, docName, campi) {
	await setDoc(doc(db, nameCollection, docName), campi);
}

async function updateData(nameCollection, docName, campi) {
	await updateDoc(doc(db, nameCollection, docName), campi);
}

async function readCollection(nameCollection, docName=null) {
	const coll = collection(db, nameCollection)
	let response = await getDocs(coll)
	const data = response.docs.map(doc=> ({data:doc.data(), id:doc.id}))
	return data;
}

async function getQuery(nameCollection){
	const coll = collection(db, nameCollection)
	const q = query(coll);
	return q;
}

async function doesDocExist(nameCollection, docName){
	const docRef = doc(db, nameCollection, `${docName}/board/initialBoard`);
	const docSnap = await getDoc(docRef);
	return docSnap.exists();
}

async function setDocUpdateCollback(nameCollection, docName, callBackFun){
	const q = query(collection(db, nameCollection, docName), orderBy("createdAt", "desc"), limit(1))
	onSnapshot(q, callBackFun);
	// 	const data = snapshot.docs.map(doc=> ({data:doc.data(), id:doc.id}))
	// 	console.log(data)
	// })
}

export {createData, readCollection, doesDocExist, updateData, setDocUpdateCollback as setLogsUpdateCollback};
