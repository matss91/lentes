
import Login from "./Login";

function App() {
  return (
    <Login
      onLogin={() => {
        console.log("Login correcto");
      }}
    />
  );
}

export default App;

