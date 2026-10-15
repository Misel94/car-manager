/**
 * One colour theme for the whole app.
 *
 * WHAT: colours, spacing, and text sizes that every screen should reuse.
 * WHY: the app stays visually consistent, and a colour change happens in
 *      this one file instead of being copied into every screen.
 */

export const theme = {
  colors: {
    /** Light grey page behind the cards. */
    background: '#F4F6F8',
    /** White surface for cards, the top bar, and form fields. */
    card: '#FFFFFF',
    /** The one blue used for buttons, links, and the + action. */
    primary: '#2563EB',
    /** Text that sits on top of the blue colour. */
    onPrimary: '#FFFFFF',
    /** Main text colour. */
    text: '#1A1D23',
    /** Quieter text, such as a car's brand and model. */
    textMuted: '#5C6570',
    /** Thin borders around cards and inputs. */
    border: '#E2E6EA',
    /** Errors and the delete action. */
    danger: '#C5362B',
  },
  spacing: {
    /** Space between the screen edge and the content. */
    screen: 16,
    /** Space inside a card. */
    card: 16,
    /** Space between stacked items. */
    gap: 12,
  },
  radius: {
    /** Rounded corners on cards. */
    card: 16,
  },
  text: {
    title: 28,
    body: 16,
  },
} as const;
