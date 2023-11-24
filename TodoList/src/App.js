import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk';
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

// ------- Update with your credentials ------------------ //
const logicId = "0x080000ef9abde1a9f6bd49393c47a6102c013029e3768d1d1d7a79cfee9e151400b529"
const mnemonic = "alarm shock caught lake divorce athlete opinion coral gasp deliver frown use"

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0"
)

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon")
  const wallet = new Wallet(provider)
  await wallet.fromMnemonic(mnemonic, accountPath)
  return await getLogicDriver(logicId, wallet)
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos")
      setTodos(tTodos)
      setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true)
      info("Adding Todo ...");
      
      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      // Waiting for tesseract to be mined
      await ix.wait()
      
      await getTodos()
      success("Successfully Added");
      setTodoName("")
      setAdding(false)
    } catch (error) {
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id)
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();
      
      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false)
    } catch (error) {
      console.log(error);
    }
  };

  const sortTodos = () => {
    const sortedTodos = [...todos].sort((a, b) => {
      // Assuming 'name' is the property you want to sort by
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setTodos(sortedTodos);
  };

  return (
    <>
      <Toaster />
      <section className="section-center">
        <form className="todo-form">
          <p className="alert"></p>
          <h3 >To do buddy</h3>
          <div className="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <button onClick={add} type="submit" className="submit-btn">
            {adding ? <Loader color={"#000"} loading={adding} /> :"Add Todo"}
            </button>
          </div>
        </form>
        {!loading ? (
          <div className="todo-container show-container">
            <button onClick={sortTodos} className="sort-btn">
              Sort
            </button>
            {todos.map((todo, index) => (
              <div className="todo-list" key={index}>
                {todo.name}
                {todo.completed ? (
                  <img className="icon" src="/images/check.svg" alt="completed" />
                ) : (
                  <span
                    onClick={() => markCompleted(index)}
                    className="underline text-red pointer"
                  >
                    {marking === index ? (
                      <Loader color={"#000"} loading={marking === 0 ? true : marking} />
                    ) : (
                      "Mark Completed!"
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>
        )}
      </section>
    </>
  );
}

export default App;
