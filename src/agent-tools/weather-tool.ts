import { Tool } from 'langchain/agents';
import axios from 'axios';

export const weatherTool: Tool = {
  name: 'WeatherTool',
  description: 'Provides weather info for a city. Input: city name',
  func: async (city: string) => {
    const res = await axios.get(`https://wttr.in/${city}?format=3`);
    return res.data;
  },
};
