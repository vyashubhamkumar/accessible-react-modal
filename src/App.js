import './App.css';
import { ModalTypes } from './components/ModalScreens';
import { useModal } from './lib';

function App() {
  const { showModal } = useModal();

  return (
    <div className="app-root">
      <button onClick={() => showModal({ type: ModalTypes.FIRST })}>
        Open {ModalTypes.FIRST}
      </button>
    </div>
  );
}

export default App;
