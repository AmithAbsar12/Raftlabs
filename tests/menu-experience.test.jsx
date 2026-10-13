import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MenuExperience } from "@/components/menu-experience";
import { menuItems } from "@/lib/menu";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("MenuExperience", () => {
  it("renders menu item details", () => {
    render(<MenuExperience items={menuItems} />);
    expect(
      screen.getByRole("heading", { name: "Ember Margherita" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
  });
  it("adds an item without opening the cart until requested", () => {
    render(<MenuExperience items={menuItems} />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Add/ })[0]);
    const cartButton = screen.getByRole("button", {
      name: "Open cart with 1 items",
    });
    expect(cartButton).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
    fireEvent.click(cartButton);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });
  it("filters menu items by search", () => {
    render(<MenuExperience items={menuItems} />);
    fireEvent.change(screen.getByLabelText("Search dishes"), {
      target: { value: "lava" },
    });
    expect(
      screen.getByRole("heading", { name: "Midnight Lava Cake" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Double Smash" }),
    ).not.toBeInTheDocument();
  });
});
