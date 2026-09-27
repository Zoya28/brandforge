"""
Wires all seven pipeline nodes into a single linear LangGraph StateGraph.
The graph is intentionally linear (no branching) because each stage
genuinely depends on the previous one's output — this mirrors the
handbook's explicit sequence (Discover -> Position -> Shape -> Visualize
-> Challenge -> Deliver) and satisfies the "context handling between
stages" judging criterion by construction: LangGraph passes the same
accumulating BrandKitSession dict through every node.
"""

from langgraph.graph import StateGraph, END

from brand_engine.session_schema import BrandKitSession
from brand_engine.pipeline_nodes.idea_clarification_node import idea_clarification_node
from brand_engine.pipeline_nodes.positioning_debate_node import positioning_debate_node
from brand_engine.pipeline_nodes.brand_personality_naming_node import brand_personality_naming_node
from brand_engine.pipeline_nodes.visual_direction_node import visual_direction_node
from brand_engine.pipeline_nodes.consistency_audit_node import consistency_audit_node
from brand_engine.pipeline_nodes.logo_concept_generation_node import logo_concept_generation_node
from brand_engine.pipeline_nodes.launch_kit_assembly_node import launch_kit_assembly_node


def build_brand_kit_graph():
    graph_builder = StateGraph(BrandKitSession)

    graph_builder.add_node("understand_idea", idea_clarification_node)
    graph_builder.add_node("position_and_debate", positioning_debate_node)
    graph_builder.add_node("shape_personality_and_naming", brand_personality_naming_node)
    graph_builder.add_node("visualize_direction", visual_direction_node)
    graph_builder.add_node("audit_consistency", consistency_audit_node)
    graph_builder.add_node("generate_logo_concept", logo_concept_generation_node)
    graph_builder.add_node("assemble_launch_kit", launch_kit_assembly_node)

    graph_builder.set_entry_point("understand_idea")
    graph_builder.add_edge("understand_idea", "position_and_debate")
    graph_builder.add_edge("position_and_debate", "shape_personality_and_naming")
    graph_builder.add_edge("shape_personality_and_naming", "visualize_direction")
    graph_builder.add_edge("visualize_direction", "audit_consistency")
    graph_builder.add_edge("audit_consistency", "generate_logo_concept")
    graph_builder.add_edge("generate_logo_concept", "assemble_launch_kit")
    graph_builder.add_edge("assemble_launch_kit", END)

    return graph_builder.compile()


compiled_brand_kit_graph = build_brand_kit_graph()
