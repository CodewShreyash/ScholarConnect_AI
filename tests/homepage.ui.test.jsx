import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../src/pages/public/Home";
import { PreferencesProvider } from "../src/context/PreferencesContext";

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));

afterEach(cleanup);

describe("homepage discovery", () => {
  it("shows category discovery without external portal links and includes the student photo badge", () => {
    const { container } = render(
      <PreferencesProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </PreferencesProvider>
    );

    expect(screen.getByRole("heading", { name: "Scholarships for every path" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /SC and ST students/ }).getAttribute("href")).toContain("Scheduled");
    expect(screen.getByRole("link", { name: /OBC, EBC, VJNT and SBC/ }).getAttribute("href")).toContain("OBC");
    expect([...container.querySelectorAll("a")].some(link => /scholarships\.gov\.in|mahadbt/i.test(link.href))).toBe(false);
    expect(container.querySelector(".sc-home-student-badge img")).toBeTruthy();
  });
});
