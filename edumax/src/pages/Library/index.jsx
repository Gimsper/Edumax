import React, { useState, useContext } from "react";
import '../../assets/css/Library.css';
import { LibraryContext } from "../../contexts/LibraryContext";
import { UserContext } from "../../contexts/UserContext"; // Asegúrate de importar tu UserContext

function Library() {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newAuthor, setNewAuthor] = useState("");
    const [newCover, setNewCover] = useState(null);
    const [newDocument, setNewDocument] = useState(null);
    const [editDoc, setEditDoc] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editCover, setEditCover] = useState(null);
    const [editDocument, setEditDocument] = useState(null);

    const { documents, addDocument, updateDocument, deleteDocument } = useContext(LibraryContext);
    const { isAuthenticated } = useContext(UserContext); // Suponiendo que tienes isLoggedIn en tu UserContext

    const filteredDocs = documents.filter(
        doc =>
            doc.title
                .toLowerCase()
                .normalize("NFD")
                .includes(search.toLowerCase().normalize("NFD")) ||
            doc.author
                .toLowerCase()
                .normalize("NFD")
                .includes(search.toLowerCase().normalize("NFD"))
    );

    const handleFileToBase64 = (file, cb) => {
        if (!file) return cb(null);
        const reader = new FileReader();
        reader.onload = () => cb(reader.result);
        reader.readAsDataURL(file);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (newTitle.trim() && newAuthor.trim() && newCover && newDocument) {
            handleFileToBase64(newCover, (coverBase64) => {
                handleFileToBase64(newDocument, (docBase64) => {
                    addDocument({
                        title: newTitle,
                        author: newAuthor,
                        cover: coverBase64,
                        document: docBase64
                    });
                    setNewTitle("");
                    setNewAuthor("");
                    setNewCover(null);
                    setNewDocument(null);
                    setShowModal(false);
                });
            });
        }
    };

    const handleEdit = (doc) => {
        if (!isAuthenticated) {
            handleViewPdf(doc.document);
            return;
        }
        setEditDoc(doc);
        setEditTitle(doc.title);
        setEditAuthor(doc.author);
        setEditCover(doc.cover || null);
        setEditDocument(doc.document || null);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editAuthor.trim()) {
            alert("Título y autor son obligatorios");
            return;
        }

        const processCover = () => {
            if (typeof editCover === "string") return Promise.resolve(editCover);
            if (editCover instanceof File) {
                return new Promise(res => handleFileToBase64(editCover, res));
            }
            return Promise.resolve(editDoc.cover);
        };

        const processDoc = () => {
            if (typeof editDocument === "string") return Promise.resolve(editDocument);
            if (editDocument instanceof File) {
                return new Promise(res => handleFileToBase64(editDocument, res));
            }
            return Promise.resolve(editDoc.document);
        };

        Promise.all([processCover(), processDoc()]).then(([coverBase64, docBase64]) => {
            updateDocument({
                ...editDoc,
                title: editTitle,
                author: editAuthor,
                cover: coverBase64,
                document: docBase64
            });
            setEditDoc(null);
        });
    };

    const handleDelete = () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este documento?")) {
            deleteDocument(editDoc.id);
            setEditDoc(null);
        }
    };

    const handleViewPdf = (base64) => {
        if (!base64) return;
        const win = window.open();
        win.document.body.style.margin = "0";
        win.document.write(
            `<iframe src="${base64}" frameborder="0" style="width:100vw;height:100vh;"></iframe>`
        );
    };

    return (
        <div className="library-container">
            <h1 className="library-title">Librería</h1>
            {isAuthenticated && (
                <button className="library-add-btn" onClick={() => setShowModal(true)}>
                    Agregar
                </button>
            )}
            <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="library-search"
            />
            <div className="library-grid">
                {filteredDocs.length > 0 ? (
                    filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            className="library-card"
                            onClick={() => handleEdit(doc)}
                            style={{ cursor: "pointer" }}
                        >
                            <h3 className="library-card-title">{doc.title}</h3>
                            {doc.cover && (
                                <img
                                    src={doc.cover}
                                    alt="Portada"
                                    className="library-card-cover"
                                    style={{ width: "100%", height: "180px", objectFit: "cover", margin: "10px 0" }}
                                />
                            )}
                            <p className="library-card-author">Autor: {doc.author}</p>
                        </div>
                    ))
                ) : (
                    <p className="library-empty">No se encontraron documentos.</p>
                )}
            </div>
            {showModal && isAuthenticated && (
                <div className="library-modal-backdrop">
                    <div className="library-modal">
                        <h2>Agregar Documento</h2>
                        <form onSubmit={handleAdd}>
                            <input
                                type="text"
                                placeholder="Título"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Autor"
                                value={newAuthor}
                                onChange={e => setNewAuthor(e.target.value)}
                                required
                            />
                            <label>
                                Portada (imagen):
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setNewCover(e.target.files[0])}
                                    required
                                />
                            </label>
                            <br />
                            <label>
                                Documento (PDF):
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => setNewDocument(e.target.files[0])}
                                    required
                                />
                            </label>
                            <div className="library-modal-actions">
                                <button type="submit">Agregar</button>
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {editDoc && isAuthenticated && (
                <div className="library-modal-backdrop">
                    <div className="library-modal">
                        <h2>Editar Documento</h2>
                        <form onSubmit={handleEditSubmit}>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                value={editAuthor}
                                onChange={e => setEditAuthor(e.target.value)}
                                required
                            />
                            <label>
                                Portada (imagen):
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditCover(e.target.files[0])}
                                />
                            </label>
                            {typeof editCover === "string" && (
                                <img
                                    src={editCover}
                                    alt="Portada actual"
                                    style={{ width: "100%", height: "120px", objectFit: "cover", margin: "10px 0" }}
                                />
                            )}
                            <br />
                            <label>
                                Documento (PDF):
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => setEditDocument(e.target.files[0])}
                                />
                            </label>
                            {editDocument && typeof editDocument === "string" && (
                                <button
                                    type="button"
                                    style={{ margin: "10px 0" }}
                                    onClick={() => handleViewPdf(editDocument)}
                                >
                                    Ver PDF
                                </button>
                            )}
                            <div className="library-modal-actions">
                                <button type="submit">Guardar</button>
                                <button type="button" onClick={() => setEditDoc(null)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    style={{ background: "#e74c3c", color: "#fff", marginLeft: "auto" }}
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export { Library };
