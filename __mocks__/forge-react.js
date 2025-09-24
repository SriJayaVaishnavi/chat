// Mock file for Forge React components
const Text = ({ children, ...props }) => <span {...props}>{children}</span>;

const TextArea = (props) => <textarea {...props} />;

const Button = ({ children, ...props }) => <button {...props}>{children}</button>;

const Form = ({ children, ...props }) => <form {...props}>{children}</form>;

const Spinner = () => <div>Loading...</div>;

export { Text, TextArea, Button, Form, Spinner };
export default { Text, TextArea, Button, Form, Spinner };