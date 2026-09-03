from arc_agent.agent import ArcScientificAgent
from arc_agent.toy_env import ToggleMoveEnv

def test_agent_toy_smoke(tmp_path):
 m=ArcScientificAgent(ToggleMoveEnv(),tmp_path).run(30);assert m.real_actions>0 and m.preregistered_predictions==m.real_actions
