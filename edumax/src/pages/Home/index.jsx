import Youtube from 'react-youtube'

import './App.css'

function Home() {
    const videoOptions = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
        },
    }

    return (
        <>
            <div className='home-background'>
                <div className='home-container'>
                    <aside>
                        <Youtube videoId="dQw4w9WgXcQ" opts={videoOptions} />
                    </aside>
                    <article>
                        <h1>¿Quiénes somos?</h1>
                        <p>EDUMAX es un proyecto que su intención es mejorar la calidad de estudio de los estudiantes, garantizando que mejoren tanto en aplicación de conocimientos, como que también disfruten el proceso de aprendizaje.</p>
                    </article>
                </div>
            </div>
        </>
    )
}

export { Home }
