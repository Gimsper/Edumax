import { createContext, useEffect, useState } from 'react';
import localforage from 'localforage';

const LibraryContext = createContext();

const DOCUMENTS_KEY = 'documents';

const LibraryProvider = ({ children }) => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        localforage.getItem(DOCUMENTS_KEY).then((docs) => {
            setDocuments(docs || []);
        });
    }, []);

    const saveDocuments = async (docs) => {
        await localforage.setItem(DOCUMENTS_KEY, docs);
        setDocuments(docs);
    };

    const addDocument = async (doc) => {
        const newDoc = { ...doc, id: Date.now().toString() };
        const updatedDocs = [...documents, newDoc];
        await saveDocuments(updatedDocs);
    };

    const getDocuments = () => documents;

    const updateDocument = async (updatedDoc) => {
        const updatedDocs = documents.map((doc) =>
            doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc
        );
        await saveDocuments(updatedDocs);
    };

    const getDocumentById = (id) => {
        return documents.find((doc) => doc.id === id);
    };

    const deleteDocument = async (id) => {
        const updatedDocs = documents.filter((doc) => doc.id !== id);
        await saveDocuments(updatedDocs);
    };

    const values = {
        documents,
        addDocument,
        getDocuments,
        updateDocument,
        deleteDocument,
        getDocumentById
    }

    return (
        <LibraryContext.Provider value={values}>
            {children}
        </LibraryContext.Provider>
    );
};

export { LibraryProvider, LibraryContext };