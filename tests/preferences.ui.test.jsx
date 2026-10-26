import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DisplayPreferences from "../src/components/layout/DisplayPreferences";
import { PreferencesProvider, usePreferences } from "../src/context/PreferencesContext";

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.lang = "en";
});

function PreferenceLabels() {
  const { t } = usePreferences();
  return <p>{t("findScholarship")}</p>;
}

describe("display preferences", () => {
  it("switches between English and Marathi and persists the selection", async () => {
    const user = userEvent.setup();
    render(<PreferencesProvider><DisplayPreferences /><PreferenceLabels /></PreferencesProvider>);

    await user.click(screen.getByRole("button", { name: "Switch language to Marathi" }));

    expect(screen.getByText("तुमच्या पुढील टप्प्यासाठी शिष्यवृत्ती शोधा")).toBeTruthy();
    expect(localStorage.getItem("sc-language")).toBe("mr");
    expect(document.documentElement.lang).toBe("mr");
  });

  it("toggles night mode and persists the selected theme", async () => {
    const user = userEvent.setup();
    render(<PreferencesProvider><DisplayPreferences /></PreferencesProvider>);

    await user.click(screen.getByRole("button", { name: "Turn on dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("sc-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Turn on light mode" })).toBeTruthy();
  });
});
