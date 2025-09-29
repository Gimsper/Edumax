import logo from '../../assets/img/edumax-logo-with-text.png'
import '../../assets/css/About.css'

function About() {
    return (
        <>
            <img src={logo} alt="Logo de Edumax" className='edumax-logo' />
            <div className='about-background'>
                <div className='about-container'>
                    <article>
                        <h1>¿Cómo nació?</h1>
                        <p>EDUMAX nació de una idea de dos jóvenes que solamente buscaban una manera más dinámica de ayudarse a ellos y a sus compañeros para comprender eficientemente los temas impartidos en el colegio. Con muchas dificultades, pero poco a poco fuimos creando cada apartado del proyecto, convencidos de nuestra idea, hasta llegar al punto que estamos ahora. Falta mucho por recorrer, pero siempre de la mano de Dios y pensando el futuro de los jóvenes lograremos cada objetivo que nos propongamos.</p>
                    </article>
                </div>
                <div className='about-container'>
                    <article>
                        <h1>Objetivo</h1>
                        <p>Mejorar la dinámica de estudio en nuestras capacidades como estudiantes por medio de diversas estrategias, garantizando así una buena experiencia de estudio y un buen plan de vida.</p>
                    </article>
                </div>
                <div className='about-container'>
                    <article>
                        <h1>Meta</h1>
                        <p>Potenciar las capacidades de los estudiantes a través de estrategias de estudio innovadoras y efectivas, brindando una experiencia de aprendizaje significativa que les permita construir un plan de vida sólido, integral y orientado al bienestar.</p>
                    </article>
                </div>
                <div className='about-container'>
                    <article>
                        <h1>Fundadores</h1>
                        <p><strong>Mikell Gamboa:</strong> Proveniente de Venezuela, es un joven de 15 años apasionado por la música que últimamente generó un gusto por los negocios, que en una clase de media técnica se puso a analizar como le afectaba a él y sus compañeros como el sistema de estudio no era lo suficientemente efectivo.</p>
                        <p><strong>Jose Angel Casas:</strong> Joven considerado por muchos problemático que actualmente está enfocado en cada uno de sus propósitos, 17 años y al igual que Mikell se propuso la meta de intentar generar un cambio, naciendo el proyecto EDUMAX, proveniente de Medellín .</p>
                    </article>
                </div>
            </div>
        </>
    )
}

export { About }
