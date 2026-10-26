import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountLayout from "../src/components/layout/AccountLayout";
import { PreferencesProvider } from "../src/context/PreferencesContext";

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "student-1", email: "shreyash@example.com" },
    profile: { role: "student", full_name: "Shreyash Pohokar" },
    signOut: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("student workspace header", () => {
  it("shows the student's name instead of their email", () => {
    render(
      <PreferencesProvider>
        <MemoryRouter>
          <AccountLayout title="Dashboard"><p>Student content</p></AccountLayout>
        </MemoryRouter>
      </PreferencesProvider>
    );

    expect(screen.getByLabelText("Account name").textContent).toBe("Shreyash Pohokar");
    expect(screen.queryByText("shreyash@example.com")).toBeNull();
  });
});
