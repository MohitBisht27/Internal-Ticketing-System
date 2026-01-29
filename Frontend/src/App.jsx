import CreateTicket from "./pages/CreateTicket";
import TicketList from "./pages/GetTicket";
import Register from "./pages/Register";
import SignIn from "./pages/Signin";
function App() {
  return (
    <div>
      {/* <Register></Register> */}
      <SignIn></SignIn>
      {/* <CreateTicket></CreateTicket> */}
      <TicketList></TicketList>
    </div>
  );
}

export default App;
