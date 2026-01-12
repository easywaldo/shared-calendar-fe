import SignUpForm from './components/SignUpForm'
import './App.css'

function App() {
  console.log('App component rendered')
  return (
    <div className="app">
      <h1 style={{ color: 'white', textAlign: 'center', paddingTop: '20px' }}>
        Shared Calendar
      </h1>
      <SignUpForm />
    </div>
  )
}

export default App
