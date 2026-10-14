// @vitest-environment jsdom
import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  JourneyProvider,
  DayPlanner,
  AnimalDirectory,
  ExperienceDetail,
  Discovery,
} from "./ExperienceUI";
const mount = (node) => render(<JourneyProvider>{node}</JourneyProvider>);
afterEach(() => {
  cleanup();
  localStorage.clear();
  location.hash = "";
});
test("planner personalises the itinerary, removes extras, and preserves existing quantities", async () => {
  const user = userEvent.setup();
  const changes = [];
  mount(
    <DayPlanner
      cart={{ adult: 2 }}
      onAdd={(id, n) => changes.push([id, n])}
      notify={() => {}}
    />,
  );
  await user.click(screen.getByRole("button", { name: /For the whole crew/ }));
  await user.click(screen.getByRole("button", { name: "Build my day" }));
  expect(
    screen.getByRole("heading", { name: "A day for wide eyes." }),
  ).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Remove The garden picnic from plan" }),
  );
  expect(screen.queryByText("The garden picnic")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Make this my day" }));
  expect(changes).toEqual([["giraffe", 1]]);
  expect(location.hash).toBe("#basket");
});
test("animal directory filters, searches, and opens an educational profile", async () => {
  const user = userEvent.setup();
  mount(<AnimalDirectory />);
  await user.click(screen.getByRole("button", { name: "Forest", exact: true }));
  expect(
    screen.queryByRole("heading", { name: "Giraffe", exact: true }),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: /Forest Tiger/ }));
  expect(screen.getByRole("dialog", { name: "Tiger" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  await user.click(screen.getByRole("button", { name: "All habitats" }));
  await user.type(
    screen.getByRole("textbox", { name: "Search animals" }),
    "flamingo",
  );
  expect(
    screen
      .getAllByRole("heading", { level: 3 })
      .filter((h) => h.textContent === "Flamingo"),
  ).toHaveLength(1);
  expect(
    screen.queryByRole("heading", { name: "Tiger", exact: true }),
  ).toBeNull();
});
test("favourites and recently viewed survive component remount and appear on discovery", async () => {
  const user = userEvent.setup();
  const view = mount(
    <ExperienceDetail
      id="giraffe"
      cart={{}}
      onAdd={() => {}}
      notify={() => {}}
    />,
  );
  await user.click(
    screen.getByRole("button", {
      name: "Save Meet the gentle giants",
      exact: true,
    }),
  );
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("qpass-saved"))).toEqual([
      "giraffe",
    ]),
  );
  expect(JSON.parse(localStorage.getItem("qpass-recent"))).toEqual(["giraffe"]);
  view.unmount();
  mount(<Discovery />);
  expect(
    screen.getByRole("heading", { name: "Your someday collection." }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Still on your mind?" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Show Concerts" }));
  expect(
    screen.getByRole("heading", { name: /Feel absolutely.*everything/ }),
  ).toBeTruthy();
});
