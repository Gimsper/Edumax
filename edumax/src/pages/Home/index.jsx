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
            <div className='home-container'>
                <aside>
                    <Youtube videoId="dQw4w9WgXcQ" opts={videoOptions} />
                </aside>
                <article>
                    <h1>¿Quiénes somos?</h1>
                    <p>Bienvenido a Edumax, tu plataforma de aprendizaje en línea.</p>
                </article>
            </div>
        </>
    )
}

export { Home }
