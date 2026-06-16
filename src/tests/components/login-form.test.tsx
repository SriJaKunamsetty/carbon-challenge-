/**
 * @file login-form.test.tsx
 * @description Tests for the LoginForm component — covering sign-in, sign-up,
 * password reset, loading state, and field change callbacks.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm, type LoginFormProps } from "@/components/auth/login-form";

const defaultProps: LoginFormProps = {
  isSignUp: false,
  isReset: false,
  email: "",
  password: "",
  name: "",
  actionLoading: false,
  onEmailChange: vi.fn(),
  onPasswordChange: vi.fn(),
  onNameChange: vi.fn(),
  onResetClick: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
};

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders email and password fields in sign-in mode", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("does not render name field in sign-in mode", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.queryByPlaceholderText("Full Name")).not.toBeInTheDocument();
  });

  it("renders name field in sign-up mode", () => {
    render(<LoginForm {...defaultProps} isSignUp={true} />);
    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  });

  it("hides password field in reset mode", () => {
    render(<LoginForm {...defaultProps} isReset={true} />);
    expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();
  });

  it("shows Forgot Password link in sign-in mode", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });

  it("calls onResetClick when Forgot Password is clicked", () => {
    const onResetClick = vi.fn();
    render(<LoginForm {...defaultProps} onResetClick={onResetClick} />);
    fireEvent.click(screen.getByText(/Forgot Password/i));
    expect(onResetClick).toHaveBeenCalledTimes(1);
  });

  it("calls onEmailChange when email input changes", () => {
    const onEmailChange = vi.fn();
    render(<LoginForm {...defaultProps} onEmailChange={onEmailChange} />);
    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "test@example.com" },
    });
    expect(onEmailChange).toHaveBeenCalledWith("test@example.com");
  });

  it("calls onPasswordChange when password input changes", () => {
    const onPasswordChange = vi.fn();
    render(<LoginForm {...defaultProps} onPasswordChange={onPasswordChange} />);
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    expect(onPasswordChange).toHaveBeenCalledWith("secret123");
  });

  it("calls onNameChange when name input changes in sign-up mode", () => {
    const onNameChange = vi.fn();
    render(<LoginForm {...defaultProps} isSignUp={true} onNameChange={onNameChange} />);
    fireEvent.change(screen.getByPlaceholderText("Full Name"), {
      target: { value: "Alice" },
    });
    expect(onNameChange).toHaveBeenCalledWith("Alice");
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables inputs when actionLoading is true", () => {
    render(<LoginForm {...defaultProps} actionLoading={true} />);
    expect(screen.getByPlaceholderText("Email Address")).toBeDisabled();
    expect(screen.getByPlaceholderText("Password")).toBeDisabled();
  });

  it("renders current email value correctly", () => {
    render(<LoginForm {...defaultProps} email="prefilled@test.com" />);
    expect(screen.getByPlaceholderText("Email Address")).toHaveValue("prefilled@test.com");
  });

  it("renders current password value correctly", () => {
    render(<LoginForm {...defaultProps} password="mypassword" />);
    expect(screen.getByPlaceholderText("Password")).toHaveValue("mypassword");
  });

  it("does not show Forgot Password link in sign-up mode", () => {
    render(<LoginForm {...defaultProps} isSignUp={true} />);
    expect(screen.queryByText(/Forgot Password/i)).not.toBeInTheDocument();
  });

  it("does not show Forgot Password link in reset mode", () => {
    render(<LoginForm {...defaultProps} isReset={true} />);
    expect(screen.queryByText(/Forgot Password/i)).not.toBeInTheDocument();
  });
});
