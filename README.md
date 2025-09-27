# ⚡ Energy Breakdown Card

> [!NOTE]
> This card is very experimental. It is not intended for general use.

A custom Home Assistant card for visualizing current energy usage with a breakdown by area and entity.

## Screenshots

![Energy Breakdown Card - Light](https://raw.githubusercontent.com/timmo001/ha-card-energy-breakdown/main/docs/screenshot-light.png)
![Energy Breakdown Card - Dark](https://raw.githubusercontent.com/timmo001/ha-card-energy-breakdown/main/docs/screenshot-dark.png)

## Features

- Visualize current energy usage
- Breakdown by area and entity
- Clean and modern interface

## Installation

### HACS (Recommended)

Since this card is not yet in the default HACS store, you need to add it as a custom repository:

1. Open HACS in your Home Assistant instance
2. Click the **3 dots** in the top right corner
3. Select **"Custom repositories"**
4. Add repository URL: `https://github.com/timmo001/ha-card-energy-breakdown`
5. Select category: **Dashboard**
6. Click **"ADD"**
7. Find "Energy Breakdown Card" in the list and click **Download**

### Manual

1. Download `energy-breakdown-card.js` from the latest release
2. Place it in your `config/www` folder
3. Add the resource in your Lovelace dashboard

## Usage

Add the card to your dashboard using the Lovelace UI editor or YAML:

```yaml
type: custom:energy-breakdown-card
power_entity: sensor.energy_consumption
```
