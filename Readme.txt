Minimax Algorithm
Time Complexity: O([branching factor]^[depth])
Space Complexity: O([branching factor]^[depth])
	- All nodes down to the given depth are generated and checked, 
	  ensuring the most minimal or maximal value.
Nodes Expanded at Depth 1: 316
Nodes Expanded at Depth 2: 96706

AB Pruning Algorithm
Time Complexity: O([branching factor]^([depth] / 2)) at BEST CASE
		 O([branching factor]^[depth]) at WORST CASE
Space Complexity: O([branching factor]^([depth] / 2)) at BEST CASE
		  O([branching factor]^[depth]) at WORST CASE
	- My justification for space complexity (in both minimax and AB 
	  pruning) NOT being branching factor times depth is that nodes are 
	  not explicitly deleted after they are explored. Their parent still 
	  maintains an active pointer to them.
Nodes Expanded at Depth 1: 316 (0 Prunes)
Nodes Expanded at Depth 2: 8992 (314 Prunes)
Nodes Expanded at Depth 3: 96739 (619 Prunes)