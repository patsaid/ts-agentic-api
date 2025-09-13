import { Tool } from 'langchain/agents';
import User from '../models/user';

export const localDBTool: Tool = {
  name: 'LocalDBTool',
  description: 'Fetch user info from DB. Input: user name',
  func: async (name: string) => {
    const user = await User.findOne({ name });
    if (!user) return `No user found with name "${name}"`;
    return `User: ${user.name}, Email: ${user.email}`;
  },
};
