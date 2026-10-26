import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ScholarshipReferenceGuide from "../src/components/public/ScholarshipReferenceGuide";
import {
  commonScholarshipDocuments,
  filterScholarshipGuide,
  scholarshipGuideStages,
} from "../src/data/scholarshipGuide";

afterEach(cleanup);

describe("scholarship reference guide", () => {
  it("organizes the supplied scheme list by study stage and filters to category", () => {
    expect(scholarshipGuideStages).toHaveLength(4);
    expect(scholarshipGuideStages.reduce((count, stage) => count + stage.schemes.length, 0)).toBe(14);
    const obc = filterScholarshipGuide(scholarshipGuideStages, "all", "OBC");
    expect(obc.reduce((count, stage) => count + stage.schemes.length, 0)).toBe(7);
    expect(obc.flatMap(stage => stage.schemes).some(scheme => scheme.openToAllCategories)).toBe(true);
    const general = filterScholarshipGuide(scholarshipGuideStages, "all", "General/Open");
    expect(general.flatMap(stage => stage.schemes)).toHaveLength(4);
    expect(general.flatMap(stage => stage.schemes).every(scheme => scheme.openToAllCategories)).toBe(true);
    expect(filterScholarshipGuide(scholarshipGuideStages, "post-graduation", "All categories")[0].id).toBe("post-graduation");
    expect(commonScholarshipDocuments).toHaveLength(10);
  });

  it("lets a visitor interactively select category and education stage", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ScholarshipReferenceGuide /></MemoryRouter>);

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter schemes by category" }), "OBC");
    expect(screen.getByText(/scheme references/)).toBeTruthy();
    expect(screen.queryByText("Pre-Matric Scholarship for Minorities")).toBeNull();
    expect(screen.getAllByText("Open across community categories").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Post-Graduation (MCA, MSc, MA, and more)" }));
    expect(screen.getByText("Government of India Post-Matric Scholarship for PG")).toBeTruthy();
    expect(screen.queryByText("Pre-Matric Scholarship for SC/ST/OBC/VJNT")).toBeNull();
  });
});
