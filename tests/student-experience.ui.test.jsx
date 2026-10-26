import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Footer from "../src/components/layout/Footer";
import StudentGuide from "../src/components/student/StudentGuide";
import ScholarshipHelpChat from "../src/components/public/ScholarshipHelpChat";
import { PreferencesProvider } from "../src/context/PreferencesContext";
import { sortScholarships } from "../src/pages/public/Scholarships";

afterEach(cleanup);

function renderWithProviders(element) {
  return render(
    <PreferencesProvider>
      <MemoryRouter>{element}</MemoryRouter>
    </PreferencesProvider>
  );
}

describe("student experience", () => {
  it("shows the team contact footer without duplicate site navigation", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText("Created by Team Grand Genious")).toBeTruthy();
    expect(screen.getByText("Name: Shreyash H Pohokar")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Visit my account GitHub: CodewShreyash/ }).getAttribute("href")).toBe("https://github.com/CodewShreyash");
    expect(screen.getByRole("link", { name: /9022164715/ }).getAttribute("href")).toBe("tel:+919022164715");
    expect(screen.queryByRole("navigation", { name: "Footer navigation" })).toBeNull();
  });

  it("answers match and document questions with the student's dashboard data", async () => {
    const user = userEvent.setup();
    const matches = [{ id: "scholarship-1", displayName: "Merit Scholarship", match: 87 }];
    const passport = { readiness: 76, documentCount: 3, documentTotal: 7 };
    renderWithProviders(<StudentGuide matches={matches} passport={passport} />);

    await user.click(screen.getByRole("button", { name: "How are my matches looking?" }));
    expect(screen.getByRole("status").textContent).toContain("Merit Scholarship (87%)");

    await user.click(screen.getByRole("button", { name: "Which documents should I prepare?" }));
    expect(screen.getByRole("status").textContent).toContain("3 of 7");
    expect(screen.getByRole("link", { name: "Document vault" }).getAttribute("href")).toBe("/student/documents");
  });

  it("lets visitors open a guided answer on the homepage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScholarshipHelpChat />);

    await user.click(screen.getByRole("button", { name: "How do I find scholarships?" }));

    expect(screen.getByRole("status").textContent).toContain("Browse scholarships");
    expect(screen.getByRole("status").textContent).toContain("education level");
  });

  it("sorts scholarship results by match, deadline, and name without mutating input", () => {
    const scholarships = [
      { displayName: "Bravo", match: 72, deadlineAt: "2027-04-01" },
      { displayName: "Alpha", match: 91, deadlineAt: "2027-02-01" },
    ];

    expect(sortScholarships(scholarships, "recommended", true).map(item => item.displayName)).toEqual(["Alpha", "Bravo"]);
    expect(sortScholarships(scholarships, "deadline", true).map(item => item.displayName)).toEqual(["Alpha", "Bravo"]);
    expect(sortScholarships(scholarships, "name", false).map(item => item.displayName)).toEqual(["Alpha", "Bravo"]);
    expect(scholarships[0].displayName).toBe("Bravo");
  });
});
