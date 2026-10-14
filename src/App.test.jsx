// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
test("complete local booking and retain digital pass and souvenir", async () => {
  window.scrollTo = vi.fn();
  document.body.innerHTML = '<div id="root"></div>';
  await import("./main.jsx");
  const user = userEvent.setup();
  await screen.findByRole("heading", { name: /A little escape/ });
  expect(
    screen.getByRole("heading", { name: "Vodafone Stadium" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /Nature & discovery/ }));
  await screen.findByText("Adult day pass");
  await user.click(screen.getAllByRole("button", { name: "Add to day" })[0]);
  await user.click(screen.getByRole("link", { name: "Animal experiences" }));
  await screen.findByText("Meet the gentle giants");
  await user.click(screen.getAllByRole("button", { name: "Add to day" })[0]);
  await user.click(screen.getByRole("link", { name: "Restaurants" }));
  await screen.findByText("The garden picnic");
  await user.click(screen.getAllByRole("button", { name: "Add to day" })[0]);
  await user.click(screen.getByRole("link", { name: "Hotel" }));
  await screen.findByText("The Garden House");
  await user.click(screen.getByRole("button", { name: "Add to day" }));
  await user.click(screen.getByRole("button", { name: /View basket/ }));
  await screen.findByText("A basket full of memories.");
  expect(JSON.parse(localStorage.getItem("qpass-cart"))).toEqual({
    adult: 1,
    giraffe: 1,
    picnic: 1,
    hotel: 1,
  });
  await user.click(
    screen.getByRole("button", { name: /Continue to checkout/ }),
  );
  await screen.findByText("Who’s coming along?");
  await user.type(screen.getByLabelText("Full name"), "Alex Explorer");
  await user.type(screen.getByLabelText("Email address"), "alex@example.com");
  await user.click(screen.getByRole("checkbox"));
  await user.click(
    screen.getByRole("button", { name: /Complete demo booking/ }),
  );
  await screen.findByText("Your day is all set.");
  expect(screen.getByText("Alex Explorer")).toBeTruthy();
  const booking = JSON.parse(localStorage.getItem("qpass-booking"));
  expect(booking.total).toBe(2980);
  expect(booking.items).toHaveLength(4);
  expect(JSON.parse(localStorage.getItem("qpass-cart"))).toEqual({});
  expect(
    screen.getByRole("img", { name: "Demo booking QR code" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("link", { name: /View souvenir ticket/ }));
  await screen.findByText("Some days stay with you.");
  expect(screen.getByText("THE SOUVENIR EDITION")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: /View digital pass/ }));
  await screen.findByText("Your day is all set.");
});
