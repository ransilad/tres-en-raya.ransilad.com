import { OutlineButton } from './OutlineButton'

const WaitPlayers = ({ backToMenu }) => {
  return (
    <>
      <div className="text-white italic">
        Esperando que se unan más jugadores
      </div>
      <div className="mt-16">
        <img src="/undraw_loading.svg" alt="" />
      </div>
      <div className="mt-5">
        <OutlineButton handleClick={backToMenu}>
          Volver al menú
        </OutlineButton>
      </div>
    </>
  )
}

export default WaitPlayers
